# Treasure Hunt Game Flow

This flowchart illustrates the lifecycle of the game, from team registration to the final win condition, including all server-side validation checks.

```mermaid
flowchart TD
    Start((Start)) --> Registration[Admin Registers Team]
    Registration -->|Assign Team ID & Start Loc 'CLG'| State_Idle

    subgraph "Player Action"
        State_Idle[Wait / Read Clue] --> Travel[Travel to Interpreted Location]
        Travel --> Scan[Scan QR Code at Location]
        Scan -->|POST /scan (DeviceID, LocID, GPS)| Server_Validation
    end

    subgraph "Server Logic"
        Server_Validation{Validation}
        Server_Validation -->|Device Banned?| End_Banned[Reject: Device Banned]
        Server_Validation -->|Team Disqualified?| End_Disq[Reject: Already Disqualified]
        Server_Validation -->|Device Mismatch?| Warn_Device[Reject: Unauthorized Device]
        
        Server_Validation -->|Checks Pass| Loc_Check{Correct Location?}
        
        %% Wrong Location Path
        Loc_Check -- No --> Strike_Check{Strikes >= 3?}
        Strike_Check -- Yes --> Action_Disq[DISQUALIFY TEAM]
        Strike_Check -- No --> Warn_Wrong[Warning: Wrong Location]
        Warn_Wrong --> State_Idle
        Action_Disq --> End_Game_Bad((Game Over))

        %% Correct Location Path
        Loc_Check -- Yes --> GPS_Check{GPS within 25m?}
        GPS_Check -- No --> Action_AutoDisq[AUTO-DISQUALIFY: GPS Cheating]
        Action_AutoDisq --> End_Game_Bad
        
        GPS_Check -- Yes --> Success_Action[Log Success Scan]
        Success_Action --> Win_Check{Locations Viited >= 5?}
        
        %% Continue Game
        Win_Check -- No --> Assign_Next[Assign Next Random Location]
        Assign_Next -->|Return Next Clue| State_Idle
        
        %% Win Game
        Win_Check -- Yes --> Calculate_Rank[Calculate Rank]
        Calculate_Rank --> Set_Complete[Mark as COMPLETED]
        Set_Complete --> End_Game_Good((WIN / FINISH))
    end
```
