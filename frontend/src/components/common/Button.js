// frontend/src/components/common/Button.js
import React from 'react';

function Button({ children, ...props }) {
    return (
        <button {...props}>
            {children}
        </button>
    );
}

export default Button;
