import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/jwt.interceptor';
import { ArcElement, BarController, BarElement, CategoryScale, Legend, LinearScale, LineController, LineElement, PieController, PointElement, Title, Tooltip } from 'chart.js';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideToastr } from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),   
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
        PieController, 
        ArcElement,
        Title,
        Tooltip,
        Legend
      )
    ),
    provideToastr({ timeOut: 3000, positionClass: 'toast-top-right' })
  ]
}).catch(err => console.error(err));
