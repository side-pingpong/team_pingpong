// frontend/src/components/common/Button.js
import React from 'react';

export default function Button({children, ...props}) {
    return (
        <button {...props}>
            {children}
        </button>
    );
}