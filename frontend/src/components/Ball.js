import { createComponent } from '@componentSystem';
import { createEffect } from '@reactivity';
import styles from './Ball.module.css';

export default function Ball({ position }) {
  const ballComponent = createComponent('div', {
    className: styles.ball || 'ball',
    attributes: {
      style: `top: ${position().top}px; left: ${position().left}px;`,
    },
  });

  // Reactive updates for the ball's position
  createEffect(() => {
    const { top, left } = position();
    console.log('top', top, 'left', left);
    ballComponent.element.style.top = `${top}px`;
    ballComponent.element.style.left = `${left}px`;
  });

  return ballComponent;
}
