module Shape (

    input [15:0]  PixelCount,
    input [15:0]  LineCount,

	output	[4:0]	LCD_R,
	output	[5:0]	LCD_G,
	output	[4:0]	LCD_B

);

    // Define square
    parameter squareTop = 100;
    parameter squareBottom = 400;
    parameter squareLeft = 200;
    parameter squareRight = 400;

    // Display green square
    assign LCD_R = 5'b00000;
    
    assign LCD_G = ( PixelCount >= squareLeft &&
        PixelCount <= squareRight &&
        LineCount >= squareTop &&
        LineCount <= squareBottom
    ) ? 6'b111111 : 6'b000000; // Green

    assign LCD_B = 5'b00000;

endmodule