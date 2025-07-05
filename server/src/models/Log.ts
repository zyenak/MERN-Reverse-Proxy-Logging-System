import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  method: string;
  url: string;
  timestamp: Date;
  status: number;
  user?: string;
  responseTime: number;
  proxyRuleId?: mongoose.Types.ObjectId;
  targetUrl?: string;
  isProxied: boolean;
  meta?: Record<string, any>;
  requestedBy?: string; // user id or username
}

const LogSchema = new Schema<ILog>({
  method: { type: String, required: true },
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: Number, required: true },
  user: { type: String },
  responseTime: { type: Number, required: true },
  proxyRuleId: { type: Schema.Types.ObjectId, ref: 'ProxyRule' },
  targetUrl: { type: String },
  isProxied: { type: Boolean, default: false },
  meta: { type: Schema.Types.Mixed },
  requestedBy: { type: String },
});

// Index for efficient querying
LogSchema.index({ timestamp: -1 });
LogSchema.index({ method: 1, timestamp: -1 });
LogSchema.index({ status: 1, timestamp: -1 });
LogSchema.index({ proxyRuleId: 1, timestamp: -1 });

export default mongoose.model<ILog>('Log', LogSchema); 