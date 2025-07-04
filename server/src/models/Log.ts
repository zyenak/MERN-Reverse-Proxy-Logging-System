import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  method: string;
  url: string;
  timestamp: Date;
  status: number;
  user?: string;
  responseTime: number;
  meta?: Record<string, any>;
}

const LogSchema = new Schema<ILog>({
  method: { type: String, required: true },
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: Number, required: true },
  user: { type: String },
  responseTime: { type: Number, required: true },
  meta: { type: Schema.Types.Mixed },
});

export default mongoose.model<ILog>('Log', LogSchema); 