import React from 'react';

export const SharedLayout = ({ title, children }) => {
  return (
    <div>
      <h1>{title}</h1>
      {/* 아래 {children} 이 코드가 없으면 'test' 글자가 화면에 나타나지 않습니다! */}
      <div>{children}</div> 
    </div>
  );
};
