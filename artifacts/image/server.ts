import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';
import { Buffer } from 'node:buffer';
import {
  FREE_IMAGE_GENERATIONS_PER_DAY,
  isUnrestrictedUser,
} from '@/lib/ai/entitlements';
import { subDays } from 'date-fns';
import {
  logImageGeneration,
  getImageGenerationCountByUserId,
} from '@/lib/db/queries';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream, session }) => {
    let draftContent = '';
    // Enhanced regex to better detect mathematical plotting requests
    const mathPlotRegex =
      /(graph|plot|equation|line of|y\s*=|quadratic|parabola|linear|cubic|exponential|sine|cosine|tan|log|polynomial|function)/i;

    if (mathPlotRegex.test(title)) {
      let equation = title.match(
        /y\s*=\s*([-+*/x0-9 .x^()sincotagle\s]+)/i,
      )?.[1];
      let label = '';
      let xRange = [-10, 10]; // Default x range
      let yRange = [-10, 10]; // Default y range

      // Extract custom ranges if specified
      const rangeMatch = title.match(
        /range\s*:\s*\[([-\d.]+)\s*,\s*([-\d.]+)\]/i,
      );
      if (rangeMatch) {
        const [_, min, max] = rangeMatch;
        xRange = [Number.parseFloat(min), Number.parseFloat(max)];
        yRange = [Number.parseFloat(min), Number.parseFloat(max)];
      }

      // Handle different types of functions
      if (/quadratic|parabola/i.test(title) && !equation) {
        // Generate random quadratic with reasonable coefficients
        const a = (Math.random() * 0.5 - 0.25).toFixed(2); // -0.25 to 0.25
        const b = (Math.random() * 4 - 2).toFixed(1); // -2 to 2
        const c = (Math.random() * 6 - 3).toFixed(1); // -3 to 3
        equation = `${a}*x*x+${b}*x+${c}`;
        label = `y=${a}x²+${b}x+${c}`;
      } else if (/linear/i.test(title) && !equation) {
        // Generate random linear function
        const m = (Math.random() * 4 - 2).toFixed(1); // -2 to 2
        const b = (Math.random() * 6 - 3).toFixed(1); // -3 to 3
        equation = `${m}*x+${b}`;
        label = `y=${m}x+${b}`;
      } else if (/sine|sin/i.test(title) && !equation) {
        equation = 'Math.sin(x)';
        label = 'y=sin(x)';
      } else if (/cosine|cos/i.test(title) && !equation) {
        equation = 'Math.cos(x)';
        label = 'y=cos(x)';
      } else if (/tan/i.test(title) && !equation) {
        equation = 'Math.tan(x)';
        label = 'y=tan(x)';
      } else if (/exponential|exp/i.test(title) && !equation) {
        equation = 'Math.exp(x)';
        label = 'y=eˣ';
      } else if (/log/i.test(title) && !equation) {
        equation = 'Math.log(x)';
        label = 'y=ln(x)';
        xRange = [0.1, 10]; // Avoid negative x for log
      } else if (equation) {
        // Sanitize and prepare custom equation
        equation = equation
          .replace(/[^0-9xX+\-*/.^ ()sincotagle]/g, '')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/log/g, 'Math.log')
          .replace(/exp/g, 'Math.exp');
        label = `y=${equation.replace(/Math\./g, '')}`;
      } else {
        // Default to linear function if no specific type is detected
        equation = 'x';
        label = 'y=x';
      }

      // Generate points with error handling
      const points = 200; // More points for smoother curves
      const step = (xRange[1] - xRange[0]) / points;
      let data = Array.from({ length: points + 1 }, (_, i) => {
        const x = xRange[0] + i * step;
        try {
          // eslint-disable-next-line no-eval
          const y = eval(
            equation.replace(/\^/g, '**').replace(/x/gi, `(${x})`),
          );
          return typeof y === 'number' &&
            Number.isFinite(y) &&
            y >= yRange[0] &&
            y <= yRange[1]
            ? y
            : null;
        } catch {
          return null;
        }
      });

      // If all points are invalid, fallback to y=x
      if (data.every((v) => v === null)) {
        data = Array.from(
          { length: points + 1 },
          (_, i) => xRange[0] + i * step,
        );
        label = 'y=x (fallback)';
      }

      const chartConfig = {
        type: 'line',
        data: {
          labels: Array.from({ length: points + 1 }, (_, i) =>
            (xRange[0] + i * step).toFixed(1),
          ),
          datasets: [
            {
              label,
              data,
              borderColor: '#4285F4',
              fill: false,
              pointRadius: 0,
              borderWidth: 2,
              tension: 0.4, // Smooth the line
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'linear',
              position: 'center',
              title: { display: true, text: 'x' },
              grid: { color: '#666666' },
              ticks: { color: '#666666' },
            },
            y: {
              type: 'linear',
              position: 'center',
              title: { display: true, text: 'y' },
              grid: { color: '#666666' },
              ticks: { color: '#666666' },
            },
          },
          plugins: {
            legend: { display: true, position: 'top' },
            title: {
              display: true,
              text: `Graph of ${label}`,
              color: '#666666',
              font: { size: 16 },
            },
          },
          animation: false,
        },
      };

      const quickChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&format=png&width=800&height=400&backgroundColor=white`;
      const response = await fetch(quickChartUrl);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      draftContent = base64;
      dataStream.writeData({ type: 'image-delta', content: base64 });

      // Rate limit: Free users - 3 images per day
      const now = new Date();
      const oneDayAgo = subDays(now, 1);
      const userId = session?.user?.id;
      const userEmail = session?.user?.email;
      if (userId && !isUnrestrictedUser(userEmail)) {
        const count = await getImageGenerationCountByUserId({
          id: userId,
          since: oneDayAgo,
        });
        if (count >= FREE_IMAGE_GENERATIONS_PER_DAY) {
          throw new Error(
            `You have reached the free tier limit of ${FREE_IMAGE_GENERATIONS_PER_DAY} images per day. Please wait before generating more.`,
          );
        }
        await logImageGeneration(userId);
      }

      return draftContent;
    }

    // Only use AI image for non-graph/image requests
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });
    draftContent = image.base64;
    dataStream.writeData({ type: 'image-delta', content: image.base64 });
    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream, session }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    // Rate limit: Free users - 3 images per day
    const now = new Date();
    const oneDayAgo = subDays(now, 1);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    if (userId && !isUnrestrictedUser(userEmail)) {
      const count = await getImageGenerationCountByUserId({
        id: userId,
        since: oneDayAgo,
      });
      if (count >= FREE_IMAGE_GENERATIONS_PER_DAY) {
        throw new Error(
          `You have reached the free tier limit of ${FREE_IMAGE_GENERATIONS_PER_DAY} images per day. Please wait before generating more.`,
        );
      }
      await logImageGeneration(userId);
    }

    return draftContent;
  },
});
