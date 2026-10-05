import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean; // option pour retirer le padding par défaut
}

const Card: React.FC<CardProps> = ({ children, className = "", noPadding = false }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded shadow-sm ${
        noPadding ? "" : "p-4"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Header de la carte
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`px-4 py-3 border-b border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

// Body de la carte
export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`p-4 ${className}`}>{children}</div>;

// Footer de la carte
export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`px-4 py-3 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

export default Card;