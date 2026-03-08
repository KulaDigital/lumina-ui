import React from 'react';

interface buttonProps {
    color?: 'primary' | 'secondary';
    onClick: () => void;
    label: string;
    disabled?: boolean;
    variant?: 'solid' | 'outline';
    className?: string;
    fullWidth?: boolean;
}

export default function Button({ 
    color = 'primary', 
    onClick, 
    label, 
    disabled = false,
    variant = 'solid',
    className = '',
    fullWidth = false
}: buttonProps) {

    const getButtonClasses = () => {
        const baseClasses = 'px-4 py-2 rounded font-medium transition-colors duration-200 ease-in-out';
        const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
        const widthClasses = fullWidth ? 'w-full' : '';

        if (variant === 'solid') {
            if (color === 'primary') {
                return `${baseClasses} ${disabledClasses} ${widthClasses} text-white`;
            } else {
                return `${baseClasses} ${disabledClasses} ${widthClasses} bg-gray-200 hover:bg-gray-300 text-gray-900`;
            }
        } else {
            // outline variant
            if (color === 'primary') {
                return `${baseClasses} ${disabledClasses} ${widthClasses} bg-transparent border-2`;
            } else {
                return `${baseClasses} ${disabledClasses} ${widthClasses} bg-transparent hover:bg-gray-100 text-gray-700 border-2 border-gray-300`;
            }
        }
    };

    const getPrimaryButtonStyle = (): React.CSSProperties => ({
        backgroundColor: 'var(--color-primary)',
        color: 'white',
    });

    const getPrimaryButtonHoverStyle = (): React.CSSProperties => ({
        backgroundColor: 'var(--color-primary-hover)',
        color: 'white',
    });

    const getPrimaryOutlineStyle = (): React.CSSProperties => ({
        backgroundColor: 'transparent',
        color: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
    });

    const getPrimaryOutlineHoverStyle = (): React.CSSProperties => ({
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        borderColor: 'var(--color-primary)',
    });

    const getSecondaryButtonStyle = (): React.CSSProperties => ({
        backgroundColor: 'var(--color-secondary)',
        color: 'white',
    });

    const getSecondaryButtonHoverStyle = (): React.CSSProperties => ({
        backgroundColor: 'var(--color-secondary-hover, #062d5c)',
        color: 'white',
    });

    const getSecondaryOutlineStyle = (): React.CSSProperties => ({
        backgroundColor: 'transparent',
        color: 'var(--color-secondary)',
        borderColor: 'var(--color-secondary)',
    });

    const getSecondaryOutlineHoverStyle = (): React.CSSProperties => ({
        backgroundColor: 'var(--color-secondary-light, rgba(10, 37, 64, 0.1))',
        color: 'var(--color-secondary)',
        borderColor: 'var(--color-secondary)',
    });

    const [isHovered, setIsHovered] = React.useState(false);

    let buttonStyle: React.CSSProperties = {};

    if (color === 'primary') {
        if (variant === 'solid') {
            buttonStyle = isHovered ? getPrimaryButtonHoverStyle() : getPrimaryButtonStyle();
        } else {
            buttonStyle = isHovered ? getPrimaryOutlineHoverStyle() : getPrimaryOutlineStyle();
        }
    } else if (color === 'secondary') {
        if (variant === 'solid') {
            buttonStyle = isHovered ? getSecondaryButtonHoverStyle() : getSecondaryButtonStyle();
        } else {
            buttonStyle = isHovered ? getSecondaryOutlineHoverStyle() : getSecondaryOutlineStyle();
        }
    }

    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`${getButtonClasses()} ${className}`}
            style={buttonStyle}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
        </button>
    )
}