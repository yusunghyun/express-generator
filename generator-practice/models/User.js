const seq = (sequelize,DataTypes) =>{
  return sequelize.define('user_seqs',{
    username: {type:DataTypes.STRING, allowNull:false},

},{
  // timestamps:false //옵션자리.
});
}

module.exports = seq;