import { supabase } from '../lib/supabase';

export async function getUserIdByEmail(email: any) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error) {
    throw new Error('Error fetching user ID');
  }

  return data.id;
}

// export async function decreaseUserCredits(row_id: any) {
//   const { data, error } = await supabase.rpc('decrease_credits', {
//     row_id,
//   });

//   if (error) {
//     throw new Error('Error updating user credits');
//   }

//   return data;
// }

export async function decreaseUserCredits(row_id: any) {
  // Input validation (optional)
  if (!row_id) {
    throw new Error('Missing required parameters: row_id');
  }

  try {
    // Retrieve current credit amount
    const userData = await getUserCredits(row_id);
    if (!userData) {
      throw new Error('User data not found');
    }

    const currentCredits = userData;
    console.log('from decrement called', currentCredits)

    // Update user credits logic
    const { data, error } = await supabase
      .from('users')
      .update({ credits: currentCredits - 1 })
      .eq('id', row_id);

    if (error) {
      throw error; // Re-throw the error for handling on client-side
    }

    return data;
  } catch (error) {
    throw error; // Re-throw any errors for client-side handling
  }
}


export async function addUserCredits(row_id: any, credit_amount: any) {
  const { data, error } = await supabase.rpc('add_credits', {
    row_id,
    credit_amount,
  });

  if (error) {
    throw new Error('Error updating user credits');
  }

  return data;
}

export async function getUserCredits(row_id: any) {
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', row_id)
    .single();

  if (error) {
    throw new Error('Error fetching user credits');
  }

  return data.credits;
}
