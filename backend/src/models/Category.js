const mongoose= require("mongoose")
const {Schema} = mongoose;


const iconSchema = new Schema(
    
        {
            url :
            {
                type : String ,
                default :"",
            },
            publicId :
            { 
                type : String,
                default :"",

            },
        },

        {_id: false}
    
)

const categorySchema = new Schema(

    {
        name :
        {
            type : String ,
            required: [true, "Category name is required"],
            unique : true,
            trim : true,
        },


        slug :
        {
            type : String,
            required : true,
            unique : true,
            lowercase: true,
            trim : true ,
        },

        description: 
        {
            type: String,
            trim: true,
            default: "",
        },

        status :
        {
            type :String,
            enum : ["active","inactive"],
            default: "active",
        },


    },
    {
        timestamps :true,
    }
)


const Category = mongoose.model("Category", categorySchema);

module.exports = Category ;