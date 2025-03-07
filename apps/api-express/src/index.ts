import express from 'express';
import { authRouter } from './auth.router';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(morgan('tiny'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

const v1Router = express.Router();
apiRouter.use('/v1', v1Router);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});


v1Router.use('/auth', authRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
