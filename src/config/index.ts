import dotenv from 'dotenv';
import { connect } from 'http2';
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config ={
    port: process.env.PORT || 5000,
    connectionString: process.env.CONNECTION_STRING || '',

}

export default config;