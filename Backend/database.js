import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
}).promise()


export async function getAllDates(){
    const [rows] = await pool.query(
        `
        SELECT date_time_of_measure
        FROM measure 
        `
    )
    return rows
}

export async function getMeasure(dateTime){
    const [rows] = await pool.query(
        `
        SELECT measures,address_of_measure,date_time_of_measure
        FROM measure
        WHERE date_time_of_measure = ?
        `,[dateTime]
    )
    return rows
}

export async function insertMeasure(measureAddress,measureDate,measureSender,measureData){
    const [result] =  await pool.query(
        `INSERT INTO measure (address_of_measure,date_time_of_measure,user_name,measures)
         VALUES(?,?,?,?)`,[measureAddress,measureDate,measureSender,measureData]
     )
     return result
}

export async function insertUser(userName,userId){
    const [result] =  await pool.query(
        `INSERT INTO allowed_users (user_name, user_id)
        VALUES (?,?)`,[userName,userId]
     )
     return result
}