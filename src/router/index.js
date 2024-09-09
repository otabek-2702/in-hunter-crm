import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { isUserLoggedIn } from './utils'
import routes from '~pages'
import SecondPage from "@/pages/second-page.vue"
import Login from "@/pages/login.vue"
import Index from "@/pages/index.vue"
import NotAuthorized from "@/pages/not-authorized.vue";
import Tables from "@/pages/tables.vue";
import DefaultLayoutWithVerticalNav from '@/layouts/default.vue';
import ability from "@/plugins/casl/ability";
import Forbidden from "@/pages/forbidden.vue";
import Employees from '@/pages/employees.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/not-authorized',
      name: 'NotAuthorized',
      component: NotAuthorized,
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: Forbidden,
    },

    {
      path: '/',
      component: DefaultLayoutWithVerticalNav,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Index',
          component: Index,
        },
        {
          path: 'tables',
          name: 'Tables',
          component: Tables,
        },
        {
          path: '/roles',
          name: 'Roles',
          component: () => import("@/pages/roles.vue"),
          meta: {
            action: 'show',
            subject:'Roles',
          }
        },
        {
          path: '/candidates',
          name: 'Candidates',
          component: () => import("@/pages/candidates.vue"),
          meta: {
            action: 'show',
            subject:'Candidates',
          }
        },
        {
          path: 'employees',
          name: 'Employees',
          component: Employees,
          meta: {
            action: 'show',
            subject:'Employees',
          }
        },
        {
          path: 'second-page',
          name: 'SecondPage',
          component: SecondPage,
          meta: {
            action: 'all',
            subject:'Administrator',
          }
        },
      ],
    },
    ...setupLayouts(routes),
  ],
});


router.beforeEach((to, from, next) => {
  // Проверка, требуется ли аутентификация для этого маршрута
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isLoggedIn = isUserLoggedIn();

    if (!isLoggedIn) {
      // Если пользователь не аутентифицирован, перенаправляем на страницу входа
      return next({ name: 'Login' });
    }
  }

  // Если пользователь аутентифицирован или маршрут не требует аутентификации,
  // проверяем права доступа на основе мета-полей
  if (to.meta && to.meta.action && to.meta.subject) {
    if (ability.can(to.meta.action, to.meta.subject)) {
      return next(); // Пользователь имеет нужные права
    } else {
      return next({ name: 'forbidden' }); // Перенаправление на страницу ошибки или входа
    }
  }

  // Если маршрут не требует дополнительных проверок, продолжаем переход
  next();
});


export default router
