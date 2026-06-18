import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/Router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
          success: { style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' } },
          error: { style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' } },
        }}
      />
    </QueryClientProvider>
  );
}
