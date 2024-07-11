const User=require('../models/user.models');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType
}=require('graphql');

//type:

const UserType=new GraphQLObjectType({
    name:'User',
    fields:()=>({
        id:{type:GraphQLID},
        name:{type:GraphQLString},
        email:{type:GraphQLString},
        phone:{type:GraphQLString},
        password:{type:GraphQLString},
        role:{type:GraphQLString},
        highest_qualification:{type:GraphQLString},
        subject:{type:GraphQLString},
        ip_address:{type:GraphQLString},
        slug:{type:GraphQLString}
    })
})




const AuthPayloadType = new GraphQLObjectType({
    name: 'AuthPayload',
    fields: {
        token: { type: GraphQLString },
        user: { type: UserType }
    }
});



//query:

const RootQuery=new GraphQLObjectType({
    name:'RootQueryType',
    fields:{
        user:{
            type:UserType,
            args:{id:{type:GraphQLID}},
            resolve(parent,args){
                return User.findById(args.id)
            }
        },
        users:{
            type:new GraphQLList(UserType),
            resolve(parent,args){
                return User.find({})
            }
        },

        dashboard: {
            type: UserType,//RETURN TYPE
            resolve(parent, args, context) {
                if (!context.user) {
                    throw new Error('You are not authenticated');
                }
                return context.user;
            }
        }
    }
})


//mutation:
const mutation=new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addUser:{
            type:UserType,
            args:{
                name:{type:new GraphQLNonNull(GraphQLString)},
                email:{type:new GraphQLNonNull(GraphQLString)},
                password:{type:new GraphQLNonNull(GraphQLString)},
                role:{
                    type: new GraphQLEnumType({
                    name:'UserRole',
                    values:{
                      'admin':{value:'admin'},
                      'superadmin':{value:'superadmin'},    
                    }
                  }),
                  defaultValue: 'admin'                    
                },
                highest_qualification:{type:GraphQLString},
                subject:{type:GraphQLString},
                ip_address:{type:GraphQLString},
                slug:{type:GraphQLString},
                phone:{type:GraphQLString}
            },
            async resolve(parent,args){

                try {
                    const { name, email, password, phone, ip_address, slug, highest_qualification, subject, role } = args;

                    // Check if user with the same email already exists
                    const emailExist = await User.findOne({ email });
                    if (emailExist) {
                        throw new Error('User with this email already exists');
                    }

                    // Check if user with the same phone number already exists
                    const phoneExist = await User.findOne({ phone });
                    if (phoneExist) {
                        throw new Error('User with this phone number already exists');
                    }


                    // Hash the password
                    const hashedPassword = await bcrypt.hash(password, 10);

                    let user = new User({
                        name,
                        email,
                        password:hashedPassword,
                        role,
                        highest_qualification,
                        subject,
                        ip_address,
                        slug,
                        phone
                    });

                    return await user.save();
                } catch (error) {
                    throw new Error(`Failed to add user: ${error.message}`);
                }
            },

        },
    
        //login:
         login: {
            type: AuthPayloadType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {
                
                try {
                    const user = await User.findOne({ email: args.email });
                    if (!user) {
                        throw new Error('User not found');
                    }

                    const isMatch = await bcrypt.compare(args.password, user.password);
                    if (!isMatch) {
                        throw new Error('Incorrect password');
                    }

                    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });

                    return { token, user };
                } catch (error) {
                    throw new Error(`Failed to login: ${error.message}`);
                }
            }
        }





    }
})


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
  });