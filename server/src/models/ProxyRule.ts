import mongoose, { Document, Schema } from 'mongoose';

export interface IProxyRule extends Document {
  enabled: boolean;
  whitelist: string[];
}

const ProxyRuleSchema = new Schema<IProxyRule>({
  enabled: { type: Boolean, default: true },
  whitelist: { type: [String], default: [] },
});

export default mongoose.model<IProxyRule>('ProxyRule', ProxyRuleSchema); 