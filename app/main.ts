import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { Environment } from './app.environment';
import { AppModule } from './app.module';

if (Environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
