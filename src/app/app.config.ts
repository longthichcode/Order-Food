import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  BarController,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(
      withDefaultRegisterables(
        CategoryScale,
        LinearScale,
        BarElement,
        LineElement,
        BarController,
        LineController,
        PointElement,
        Title,
        Tooltip,
        Legend
      )
    ),
    provideClientHydration(withEventReplay())
  ]
};
