import * as React from 'react';
import Drawer from '@mui/material/Drawer';

interface CommonDrawerProps {
    open: boolean;
    children: React.ReactNode;
    close: () => void;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    height?: string;
}

export default function CommonDrawer({ open, close, children, placement = 'right',
}: CommonDrawerProps) {


    return (
        <Drawer open={open} onClose={close}
            anchor={placement}
            PaperProps={{
                sx: {
                    width: placement === 'left' || placement === 'right' ? '85vw' : '100%',
                    padding: '20px 50px 0px 50px',
                    transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            }}
            sx={{
                '& .MuiBackdrop-root': {
                    transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            }}>
            {children}

        </Drawer>
    )
}