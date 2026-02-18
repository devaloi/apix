import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`🚀 apix server running on port ${config.PORT} [${config.NODE_ENV}]`);
});
