'use client';

import React, { useRef, useCallback, ReactNode } from 'react';

interface ClickSparkProps {
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
    easing?: string;
    extraScale?: number;
    children: ReactNode;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
    sparkColor = '#fff',
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = 'ease-out',
    extraScale = 1.0,
    children
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const createSpark = useCallback(
        (x: number, y: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const cx = x - rect.left;
            const cy = y - rect.top;

            canvas.width = rect.width;
            canvas.height = rect.height;

            const sparks: {
                x: number;
                y: number;
                angle: number;
                velocity: number;
                size: number;
            }[] = [];

            for (let i = 0; i < sparkCount; i++) {
                const angle = (Math.PI * 2 * i) / sparkCount;
                sparks.push({
                    x: cx,
                    y: cy,
                    angle,
                    velocity: sparkRadius * extraScale * (0.5 + Math.random() * 0.5),
                    size: sparkSize * extraScale * (0.5 + Math.random() * 0.5)
                });
            }

            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                sparks.forEach(spark => {
                    const easedProgress = 1 - Math.pow(1 - progress, 3);
                    const currentX = spark.x + Math.cos(spark.angle) * spark.velocity * easedProgress;
                    const currentY = spark.y + Math.sin(spark.angle) * spark.velocity * easedProgress;
                    const currentSize = spark.size * (1 - easedProgress);
                    const currentOpacity = 1 - easedProgress;

                    ctx.save();
                    ctx.globalAlpha = currentOpacity;
                    ctx.fillStyle = sparkColor;
                    ctx.beginPath();

                    // Star shape
                    const outerRadius = currentSize;
                    const innerRadius = currentSize / 2;
                    for (let j = 0; j < 5; j++) {
                        const outerAngle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                        const innerAngle = outerAngle + Math.PI / 5;
                        if (j === 0) {
                            ctx.moveTo(
                                currentX + Math.cos(outerAngle) * outerRadius,
                                currentY + Math.sin(outerAngle) * outerRadius
                            );
                        } else {
                            ctx.lineTo(
                                currentX + Math.cos(outerAngle) * outerRadius,
                                currentY + Math.sin(outerAngle) * outerRadius
                            );
                        }
                        ctx.lineTo(
                            currentX + Math.cos(innerAngle) * innerRadius,
                            currentY + Math.sin(innerAngle) * innerRadius
                        );
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            };

            requestAnimationFrame(animate);
        },
        [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale]
    );

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            createSpark(e.clientX, e.clientY);
        },
        [createSpark]
    );

    return (
        <div ref={containerRef} className="relative" onClick={handleClick}>
            <canvas
                ref={canvasRef}
                className="pointer-events-none fixed inset-0 z-[9999]"
                style={{ width: '100vw', height: '100vh' }}
            />
            {children}
        </div>
    );
};

export default ClickSpark;
