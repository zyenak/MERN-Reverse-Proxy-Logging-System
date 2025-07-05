import mongoose, { Document, Schema } from 'mongoose';

export interface IProxyRule extends Document {
  name: string;
  path: string;
  methods: string[];
  loggingEnabled: boolean;
  isBlocked: boolean;
  forwardTarget?: string;
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProxyRuleSchema = new Schema<IProxyRule>({
  name: { type: String, required: true, trim: true },
  path: { type: String, required: true, trim: true },
  methods: { 
    type: [String], 
    required: true, 
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    default: ['GET']
  },
  loggingEnabled: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  forwardTarget: { type: String, trim: true },
  priority: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Index for efficient rule matching
ProxyRuleSchema.index({ path: 1, priority: -1 });
ProxyRuleSchema.index({ enabled: 1 });

export default mongoose.model<IProxyRule>('ProxyRule', ProxyRuleSchema); 