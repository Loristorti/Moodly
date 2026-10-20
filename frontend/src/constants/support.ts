/**
 * Shown to an employee right after a low mood (1 or 2).
 * Static content: nothing is recorded or sent anywhere when it is displayed.
 */
export interface SupportResource {
  emoji: string
  title: string
  text: string
}

export const SUPPORT_RESOURCES: SupportResource[] = [
  {
    emoji: '💬',
    title: 'En parler autour de vous',
    text: 'À un collègue de confiance, à votre manager ou au service RH.',
  },
  {
    emoji: '🩺',
    title: 'La médecine du travail',
    text: 'Vous pouvez demander un rendez-vous à tout moment. Il reste confidentiel.',
  },
  {
    emoji: '📞',
    title: 'En cas de grande détresse : 3114',
    text: 'Numéro national de prévention du suicide, gratuit, 24 h/24 et 7 j/7.',
  },
]

/** Moods at or below this score show the support message */
export const LOW_MOOD_MAX_SCORE = 2
