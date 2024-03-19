//////////////
/* Includes */
#include <Arduino.h>
#include "main.h"

////////////////////
/* Private Macros */
#if defined(BUILD_UNO)
#elif defined(BUILD_NANO)
#else
#endif

///////////////////
/* Private Types */

//////////////////
/* Private Data */

/////////////////////////////////
/* Private Function Prototypes */
void setup(void);
void loop(void);

/////////////////////////////////
/* Public Function Definitions */

//////////////////////////////////
/* Private Function Definitions */
void setup(void)
{
    Serial.begin(MONITOR_SPEED);
}

void loop(void)
{

}