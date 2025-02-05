/* eslint-disable prettier/prettier */
import { UserCredential, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { UserRepository } from './../repositories'
import { COLLECTIONS, DBFactory } from '@/database'
import { IUserModel, Create } from './user-model'

// TODO: ENTIDADE User
export class User implements IUserModel {
  private database = DBFactory.database()

  constructor(private user: UserRepository) { }

  async create(userAuth: UserCredential): Promise<Create.Props> {
    const userRef = doc(
      this.database.getCollection(COLLECTIONS.USERS),
      userAuth.user.uid,
    )

    try {
      userAuth.user.getIdToken().then((token) => {
        this.user.accessToken = token
      })

      await updateProfile(userAuth.user, {
        displayName: this.user.username,
        photoURL: this.user.photoUrl,
      })

      await setDoc(userRef, {
        username: this.user.username,
        email: this.user.email,
        password: this.user.password,
        photoUrl: this.user.photoUrl,
        accessToken: this.user.accessToken,
      })

      return {
        user: this.user,
        message: 'Usuário criado com sucesso',
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          return 'Email já cadastrado'
        }
      }
    }

    return 'Ops! Aconteceu um erro inesperado'
  }
}
