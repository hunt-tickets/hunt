import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import React from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

export const toast = {
  success: ({ title, description, duration = 4000 }: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <Alert variant="success" appearance="solid" size="md" close onClose={() => sonnerToast.dismiss(t)}>
          <AlertIcon>
            <CheckCircle2 />
          </AlertIcon>
          <AlertTitle>{title}</AlertTitle>
        </Alert>
      ),
      { duration }
    );
  },

  error: ({ title, description, duration = 4000 }: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <Alert variant="destructive" appearance="solid" size="md" close onClose={() => sonnerToast.dismiss(t)}>
          <AlertIcon>
            <XCircle />
          </AlertIcon>
          <AlertTitle>{title}</AlertTitle>
        </Alert>
      ),
      { duration }
    );
  },

  warning: ({ title, description, duration = 4000 }: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <Alert variant="warning" appearance="solid" size="md" close onClose={() => sonnerToast.dismiss(t)}>
          <AlertIcon>
            <AlertCircle />
          </AlertIcon>
          <AlertTitle>{title}</AlertTitle>
        </Alert>
      ),
      { duration }
    );
  },

  info: ({ title, description, duration = 4000 }: ToastOptions) => {
    return sonnerToast.custom(
      (t) => (
        <Alert variant="info" appearance="solid" size="md" close onClose={() => sonnerToast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>{title}</AlertTitle>
        </Alert>
      ),
      { duration }
    );
  },
};
