import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import pool from './db';

const app = express();
const port = process.env.PORT || 3001;

// Seguridad HTTP headers
app.use(helmet());

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
}));

app.use(express.json());

// Middleware de logging para depuración
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', async (req, res) => {

  const result = await pool.query('SELECT NOW()');
  res.json({ message: 'API LTI Backend funcionando', time: result.rows[0].now });
});

// Ejemplo de endpoint seguro con validación
app.post('/echo',
  body('text').isString().isLength({ min: 1, max: 200 }).trim().escape(),
  (req, res): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    res.json({ echo: req.body.text });
  }
);

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
