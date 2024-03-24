import { useTheme } from '@mui/material';
import { Box, Typography, SvgIcon, SvgIconProps } from '@mui/material';

export const TaskTreeLogoIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <svg xmlns='http://www.w3.org/2000/svg' fill='#fff' viewBox='0 0 93.76 93.76' strokeWidth={5} stroke='#fff'>
      <rect x='8.06' y='6.72' width='77.13' height='81.25' />
    </svg>
    <svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 93.76 93.76' strokeWidth={0} stroke='currentColor'>
      <path d='M50.24,69.49c.86,0,1.48,0,2.11,0,7.25-.02,14.49-.03,21.74-.05.38,0,.76,0,1.14,0,1.5,0,2.55-.72,2.56-2.22,0-1.53-1.1-2.15-2.59-2.15-7.5,0-15-.01-22.5-.02-.92,0-1.84,0-2.74,0,0-2.51-.02-4.74.02-6.96,0-.4.18-.92.47-1.16,4.08-3.37,8.2-6.7,12.52-10.22.1-.78.24-1.95.42-3.36-2.95.81-4.92,2.75-7.05,4.41-2.13,1.66-4.22,3.37-6.52,5.21,0-2.7-.12-5.09.06-7.47.07-.95.55-2.11,1.25-2.72,3.46-2.99,7.03-5.85,10.59-8.72,2-1.61,4.05-3.16,6.1-4.76-1.13-.85-2.14-1.6-3.11-2.33-4.91,4.01-9.78,7.99-15.03,12.28v-19h-5.77v19c-5.32-4.22-10.26-8.12-15.15-12-1.06.75-2.06,1.45-3.15,2.21.39.31.68.54.98.77,5.15,4.04,10.32,8.06,15.44,12.14.71.56,1.66,1.36,1.72,2.11.21,2.74.08,5.51.08,8.63-4.61-3.65-8.91-7.05-13.2-10.45-.18,1.03.16,1.82.13,2.59-.06,1.43.58,2.2,1.7,3.03,3.37,2.49,6.62,5.15,9.88,7.79.56.45,1.27,1.13,1.3,1.73.15,2.37.06,4.76.06,7.26-3.61,0-7.03,0-10.46,0-4.89-.01-9.79-.07-14.68-.04-2,.01-3.38,1.88-2.32,3.24.54.69,1.82,1.11,2.78,1.13,7.44.1,14.87.07,22.31.08.67,0,1.33,0,2.35,0-.69,1.88-1.3,3.4-1.81,4.96-.66,1.99-1.85,2.79-4.05,2.62-3.1-.23-6.23-.13-9.34-.06-1.76.04-2.94,1.21-2.87,2.68.09,1.75,1.28,2.34,2.82,2.48.25.02.51.03.76.03,12.08.01,24.16.03,36.23.03,2.19,0,3.38-.94,3.34-2.52-.03-1.63-1.35-2.68-3.48-2.7-2.54-.02-5.09.15-7.62-.02-1.58-.11-3.51,1.07-4.7-.69-.95-1.4-1.53-3.05-2.21-4.62-.25-.57-.3-1.22-.53-2.17ZM30.68,20.8c.14-4.76-3.85-9.14-8.47-9.3-4.66-.16-8.96,3.9-9.14,8.65-.18,4.82,3.69,9,8.52,9.2,4.83.2,8.95-3.67,9.09-8.55ZM30.31,47.15c.15-4.71-3.9-9.08-8.52-9.2-4.48-.12-8.7,3.92-8.85,8.48-.17,5.18,3.34,9.21,8.17,9.38,5.36.19,9.04-3.27,9.2-8.65ZM80.7,20.6c.09-4.73-3.7-8.85-8.26-8.98-4.74-.14-9.09,4.06-9.17,8.85-.09,4.96,3.56,8.85,8.41,8.96,5.03.11,8.93-3.7,9.02-8.82ZM72.44,55.88c4.76-.03,8.26-3.79,8.23-8.86-.02-5.17-3.77-8.95-8.86-8.95-4.52,0-8.31,4.18-8.3,9.15.01,4.9,3.92,8.7,8.93,8.67ZM41.14,13.99c.03,3.29,2.41,5.82,5.49,5.83,3.33.02,6.02-2.59,5.99-5.82-.02-2.99-2.81-5.98-5.58-5.97-3.17,0-5.94,2.8-5.91,5.96ZM74.41,93.76H19.35c-10.68,0-19.35-8.66-19.35-19.35V19.35C0,8.66,8.66,0,19.35,0h55.07c10.68,0,19.35,8.66,19.35,19.35v55.07c0,10.68-8.66,19.35-19.35,19.35Z' />
    </svg>
  </SvgIcon>
);

export const TaskTreesLogo = () => {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{ marginBottom: 0, justifyContent: 'center', alignItems: 'center', display: 'flex' }} variant='h3'>
        <TaskTreeLogoIcon sx={{ width: '35px', height: '35px', mr: '10px', color: theme.palette.primary.main }} />
        TaskTrees
      </Typography>
      <Box sx={{ width: '100%', marginTop: -1, marginBottom: 4 }}>
        <Typography variant='caption' sx={{ width: '100%' }}>
          Team Edition
        </Typography>
      </Box>
    </Box>
  );
};
