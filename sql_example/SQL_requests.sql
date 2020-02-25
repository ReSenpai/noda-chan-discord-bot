-- #####################################################
-- [ ADD DATA TO DB ]

-- SELECT DATABASE
USE mydb;

-- GET USER ID
SELECT @userID := 322;

-- ADD USER
INSERT INTO users (user_id, name)
	VALUES (@userID, 'Vasia');

-- ADD QUESTION
INSERT INTO questions (text)
	VALUES ('Ты охуел?');

-- GET QUESTION ID
SELECT @questionID := LAST_INSERT_ID();

-- INSERT ANSWER
INSERT INTO answers (text)
	VALUE ('Да.');

-- GET ANSWER ID
SELECT @answerID := LAST_INSERT_ID();

-- LINK THE QUESTION AND THE ANSWER
INSERT INTO conn_quest_ans (question_id, answer_id, user_id)
	VALUES (@questionID, @answerID, @userID);
    
-- ############################################################
-- [ GET DATA FROM DB ]

-- GET USER ID
SELECT @userID := 1408;

-- GET USER'S COINS AND EXP
SELECT @user_coins := coins, @user_exp := exp FROM users
	WHERE user_id = @userID;

-- INCREMENT COINS AND EXP
UPDATE users SET coins = @user_coins + 1, exp = @user_exp + 1
	WHERE user_id = @userID;
    
-- SEARCH THE QUESTION
-- TRY REGEXP NEXT TIME !!!
SELECT @questionID := question_id FROM questions
	WHERE text = 'Ты охуел?';
    
-- GET ALL RELATED ANSWERS' IDs
SELECT @answID := answer_id, @relatedUserID := user_id FROM conn_quest_ans
	WHERE question_id IN (@questionID);

-- GET ALL ANSWERS
SELECT text FROM answers
	WHERE answer_id IN (@answID)
    
-- @relatedUserID might be used to choose the best answer