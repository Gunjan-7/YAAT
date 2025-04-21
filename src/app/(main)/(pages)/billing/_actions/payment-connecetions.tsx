'use server'

import { db } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'


export const onPaymentDetails = async () => {
  const user = await currentUser()
  const userId = user?.id

  if (userId) {
    const connection = await db.user.findFirst({
      where: {
        clerkId: userId,
      },
      select: {
        tier: true,
        credits: true,
      },
    })

    if (connection) {
      return connection
    }
  }
}
