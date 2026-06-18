export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  WORKSPACE: {
    STANDARD: {
      DASHBOARDS: {
        INTERN: '/intern/dashboard',
        BUDDY: '/buddy/dashboard',
        TECH_LEAD: '/tech-lead/dashboard',
        MANAGER: '/manager/dashboard',
        HR: '/hr/dashboard',
      },
      INTERNS: '/interns',
      PROFILE: '/interns/:id',
      CREATE_INTERN: '/interns/new',
      ONBOARDING_ACTIVITY: '/onboarding/activity',
      MAP_MANAGER: '/assign/manager',
      MAP_TECH_LEAD: '/assign/techlead',
      MAP_BUDDY: '/assign/buddy',
      SUBMIT_STANDUP: '/standup/new',
      STANDUP_FEED: '/standup/feed',
      PROGRESS: '/progress/:id',
    },
  },
};

export function getDashboardRouteForRole(role?: string): string {
  switch (role) {
    case 'HR': return ROUTES.WORKSPACE.STANDARD.DASHBOARDS.HR;
    case 'MANAGER': return ROUTES.WORKSPACE.STANDARD.DASHBOARDS.MANAGER;
    case 'TECH_LEAD': return ROUTES.WORKSPACE.STANDARD.DASHBOARDS.TECH_LEAD;
    case 'BUDDY': return ROUTES.WORKSPACE.STANDARD.DASHBOARDS.BUDDY;
    case 'INTERN':
    default: return ROUTES.WORKSPACE.STANDARD.DASHBOARDS.INTERN;
  }
}
