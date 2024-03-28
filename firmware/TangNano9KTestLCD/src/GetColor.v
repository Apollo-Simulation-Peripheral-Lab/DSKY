module GetColor (
    input [15:0]  PixelCount,
    input [15:0]  LineCount,
    output [4:0]  LCD_R,
    output [5:0]  LCD_G,
    output [4:0]  LCD_B
);

reg SQ1_PRESENT;
Square #(100,400,200,400) SQUARE_1 (
    .PixelCount(PixelCount),
    .LineCount(LineCount),
    .SHAPE_PRESENT( SQ1_PRESENT)
);

reg [7:0] red, green, blue;
//reg [32:0] address;
//reg [7:0] memory[0:3822];

//parameter HEX_FILE_PATH = "../bitmaps/segment_h.hex";
//parameter IMAGE_WIDTH = 49;

//initial begin
//    $readmemh(HEX_FILE_PATH,memory,0,3822); // read file from INFILE
//end

assign LCD_R = red >> 3;
assign LCD_G = green >> 2;
assign LCD_B = blue >> 3;

always @(PixelCount, LineCount,/* memory, address, */SQ1_PRESENT) begin
    //address <= (LineCount * IMAGE_WIDTH + PixelCount) * 3;
    //if (PixelCount <= IMAGE_WIDTH) begin
    //    red   <= memory[address];
    //    green <= memory[address+1];
    //    blue  <= memory[address+2];
    //end else begin
        red <= 8'h00;
        green <= SQ1_PRESENT ? 8'hFF : 8'h00;
        blue <= 8'h00;
    //end
end

endmodule
