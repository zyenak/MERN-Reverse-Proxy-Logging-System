import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, ShieldOff } from 'lucide-react';
import { cn, getStatusColor, getMethodColor } from '@/utils';
import { STATUS_COLORS, METHOD_COLORS } from '@/constants';

interface StatusBadgeProps {
  status: number | string;
  type?: 'status' | 'method' | 'rule';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  pending: Clock,
  active: Shield,
  disabled: ShieldOff,
};

const getStatusType = (status: number | string): keyof typeof statusIcons => {
  if (typeof status === 'number') {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'pending';
  }
  
  const statusStr = status.toString().toLowerCase();
  if (statusStr.includes('success') || statusStr.includes('active')) return 'success';
  if (statusStr.includes('error') || statusStr.includes('failed')) return 'error';
  if (statusStr.includes('warning') || statusStr.includes('pending')) return 'warning';
  if (statusStr.includes('disabled') || statusStr.includes('inactive')) return 'disabled';
  return 'pending';
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  size = 'md',
  showIcon = true,
  className,
}) => {
  const statusType = getStatusType(status);
  const Icon = statusIcons[statusType];

  const getBadgeClasses = () => {
    switch (type) {
      case 'status':
        return getStatusColor(typeof status === 'number' ? status : 200);
      case 'method':
        return getMethodColor(status.toString());
      case 'rule':
        return statusType === 'success' ? STATUS_COLORS.SUCCESS : STATUS_COLORS.ERROR;
      default:
        return STATUS_COLORS.DEFAULT;
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        getBadgeClasses(),
        sizeClasses[size],
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  );
};

// Specialized badge components
export const HttpStatusBadge: React.FC<{ status: number; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  size = 'md',
}) => (
  <StatusBadge status={status} type="status" size={size} />
);

export const MethodBadge: React.FC<{ method: string; size?: 'sm' | 'md' | 'lg' }> = ({
  method,
  size = 'md',
}) => (
  <StatusBadge status={method} type="method" size={size} showIcon={false} />
);

export const RuleStatusBadge: React.FC<{ 
  enabled: boolean; 
  isBlocked: boolean; 
  size?: 'sm' | 'md' | 'lg' 
}> = ({ enabled, isBlocked, size = 'md' }) => {
  if (!enabled) {
    return <StatusBadge status="Disabled" type="rule" size={size} />;
  }
  
  if (isBlocked) {
    return <StatusBadge status="Blocked" type="rule" size={size} />;
  }
  
  return <StatusBadge status="Active" type="rule" size={size} />;
};

// Response time badge
export const ResponseTimeBadge: React.FC<{ 
  time: number; 
  size?: 'sm' | 'md' | 'lg' 
}> = ({ time, size = 'md' }) => {
  const getTimeColor = (ms: number) => {
    if (ms < 100) return STATUS_COLORS.SUCCESS;
    if (ms < 500) return STATUS_COLORS.WARNING;
    return STATUS_COLORS.ERROR;
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        getTimeColor(time),
        sizeClasses[size],
        'inline-flex items-center gap-1'
      )}
    >
      <Clock className="h-3 w-3" />
      {time}ms
    </Badge>
  );
}; 