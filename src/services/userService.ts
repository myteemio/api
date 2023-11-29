import { User } from '../models/User';

export async function createNewUser(user: User): Promise<User> {
  if (user.email && !isEmailValid(user.email)) {
    throw new Error('Email is not valid');
  }

  return await new User(user).save();
}

export async function findUserByEmail(email: string) {
  if (isEmailValid(email)) {
    return await User.findOne({ email: email });
  }
  return null;
}

function isEmailValid(email: string) {
  var emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email) return false;

  if (email.length > 254) return false;

  var valid = emailRegex.test(email);
  if (!valid) return false;

  var parts = email.split('@');
  if (parts[0].length > 64) return false;

  var domainParts = parts[1].split('.');
  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return false;

  return true;
}
