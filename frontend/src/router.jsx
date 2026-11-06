import React, { createContext, useContext, useEffect, useState } from 'react';

const NavigationContext = createContext({ path: '/', navigate: () => {} });

export function BrowserRouter({ children }) {
  const readLocation = () => ({ path: window.location.pathname, key: `${window.location.pathname}${window.location.search}` });
  const [location, setLocation] = useState(readLocation);
  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setLocation(readLocation());
    window.scrollTo(0, 0);
  };
  return <NavigationContext.Provider value={{ path: location.path, key: location.key, navigate }}>{children}</NavigationContext.Provider>;
}

export function Link({ to, onClick, children, ...props }) {
  const { navigate } = useContext(NavigationContext);
  return <a {...props} href={to} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      navigate(to);
    }
  }}>{children}</a>;
}

export function useNavigate() { return useContext(NavigationContext).navigate; }

export function Routes({ children }) {
  const { path } = useContext(NavigationContext);
  const routes = React.Children.toArray(children);
  const match = routes.find((route) => route.props.path === path) || routes.find((route) => route.props.path === '*');
  return match?.props.element || null;
}

export function Route() { return null; }
