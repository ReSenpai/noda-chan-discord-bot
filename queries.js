const sql_add_user = 
`INSERT IGNORE INTO users (user_id, user_name, server_name) 
    VALUES (?, ?, ?)`;

const sql_get_user_info = 
`SELECT * FROM users 
    WHERE user_id = ?`;

const sql_upd_user_info = 
`UPDATE users 
    SET coins = ?, exp = ?, lvl = ?, questions = ? 
    WHERE user_id = ?`;

const sql_add_question = 
`INSERT INTO questions (text) 
    VALUES (?)`;
                            
const sql_add_answer = 
`INSERT INTO answers (text) 
    VALUES (?)`;

const sql_connect_question = 
`INSERT INTO conn_quest_ans (question_id, answer_id, user_id, type) 
    VALUES (?, ?, ?, ?)`;

const sql_find_question = 
`SELECT questions.text AS question, answers.text AS answer, type, user_id, 
    MATCH (questions.text) AGAINST (? IN BOOLEAN MODE) AS score 
    FROM questions 
    JOIN conn_quest_ans ON questions.question_id = conn_quest_ans.question_id AND (type = 0 OR user_id = ?) 
    JOIN answers USING (answer_id) 
    ORDER BY score 
    DESC LIMIT 100`;
    
module.exports = {sql_add_user, sql_get_user_info, sql_upd_user_info, sql_add_question, sql_add_answer, sql_connect_question, sql_find_question};