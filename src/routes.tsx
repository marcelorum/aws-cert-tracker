import { createBrowserRouter } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { TopicDetailPage } from './pages/TopicDetailPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'checklist', element: <ChecklistPage /> },
        { path: 'topic/:topicId', element: <TopicDetailPage /> },
      ],
    },
  ],
  { basename: '/clftrack' }
);