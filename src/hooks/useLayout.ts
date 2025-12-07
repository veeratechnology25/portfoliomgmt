import { useTheme, useMediaQuery } from '@mui/material';

export interface UseLayoutReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  drawerWidth: {
    expanded: number;
    collapsed: number;
    mobile: number;
  };
  appBarHeight: number;
  spacing: (multiplier: number) => string;
  theme: any;
}

export const useLayout = (): UseLayoutReturn => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const drawerWidth = {
    expanded: 280,
    collapsed: 72,
    mobile: 280,
  };
  
  const appBarHeight = 64;
  
  const spacing = (multiplier: number) => theme.spacing(multiplier);
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    drawerWidth,
    appBarHeight,
    spacing,
    theme,
  };
};

// Alternative simple version if you don't need all breakpoints:
export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  return {
    isMobile,
    isDesktop,
  };
};