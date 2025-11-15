import React from 'react';
import logoImage from '../../assets/images/pingpong_logo.png';

function Logo() {
    return (
        <div className="flex justify-center mb-8">
            <img src={logoImage} alt="PingPong Logo" className="h-40"/>
        </div>
    );
}

export default Logo;
