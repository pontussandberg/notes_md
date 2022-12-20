const router = require('express').Router();
import { handleLogin } from './handlers'

router.post('/', handleLogin);

export default router