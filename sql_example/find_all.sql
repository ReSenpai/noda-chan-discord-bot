CREATE FUNCTION `find_all` ()
RETURNS INTEGER
BEGIN
  DECLARE tags_list varchar(2000) ;
  DECLARE tags varchar(800) ;

  SET @start_loc := 1;
  SET @start_pos := -1;
  SET @end_pos := -1;

  SET @total_len =  LENGTH(str);

  WHILE @start_loc < @total_len
  DO

    SET @start_pos := LOCATE('#',str,@start_loc);
    SET @end_pos := LOCATE('#',str,@start_pos+1 );


    IF @start_pos > 1 AND @end_pos > 0 THEN
      SET @len = @end_pos - @start_pos + 1;


      SET tags := SUBSTRING(str, @start_pos, @len);
    IF  tags_list IS NULL THEN
        SET tags_list :=  tags;
    ELSE
      set tags_list  := CONCAT_WS("
", tags_list, tags);
    END IF;
        SET @start_loc := @end_pos+1;
    ELSE
      SET @start_loc := @total_len+1;
    END IF;

  END WHILE;


  IF  tags_list IS NULL THEN
        SET tags_list :=  '';
  END IF;

  RETURN tags_list;
END