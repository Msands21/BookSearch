const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    return userData
            }

            throw new AuthenticationError('Please log in!');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('Incorrect Username!')
            }

            const correctPw = user.isCorrectPassword(password);
            if(!correctPw) {
                throw new AuthenticationError('Incorrect Password!')
            }

            const token = signToken(user);

            return { token, user }
        },
        saveBook: async (parent, {input}, context) => {
            console.log(input)
            if (context.user) {

                const user = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                );

                return user;
            }

            throw new AuthenticationError('Please log in!');
        }, 
        deleteBook: async (parent, args, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );

                return updatedUser;
            }

            throw new AuthenticationError('Please log in!');
        }
    }
}

module.exports = resolvers;