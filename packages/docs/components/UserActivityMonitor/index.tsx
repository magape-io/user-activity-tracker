import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import { UserActivityMonitor } from "@magape-track/core";
import styles from "./styles.module.css";

const API_ENDPOINT = "https://d1-db.andy00614a.workers.dev/api/activities";

const ActivityMonitor = () => {
  const [monitorData, setMonitorData] = useState({
    isActive: true,
    activeTime: 0,
    pauseReason: null,
    userInfo: null,
  });

  const [noActivityThreshold, setNoActivityThreshold] = useState("5");
  const monitorRef = useRef(null);

  // Helper function to cleanup monitor
  const cleanupMonitor = () => {
    if (
      monitorRef.current?.destrody &&
      typeof monitorRef.current.destroy === "function"
    ) {
      try {
        monitorRef.current.destroy();
        monitorRef.current = null;
      } catch (error) {
        console.error("Error cleaning up monitor:", error);
      }
    }
  };

  useEffect(() => {
    cleanupMonitor();

    try {
      monitorRef.current = new UserActivityMonitor({
        noActivityThreshold: Number(noActivityThreshold) * 1000 || 10000,
        sendInterval: 10000,
        endpoint: API_ENDPOINT,
        gameId: "game_001",
        gameName: "Super Mario",
      });

      const updateInterval = setInterval(() => {
        if (monitorRef.current) {
          const userInfo = monitorRef.current.getUserInfo();
          setMonitorData({
            isActive: userInfo.isActive,
            activeTime: Math.ceil(monitorRef.current.getActiveTime()),
            pauseReason: userInfo.pauseReason,
            userInfo: userInfo,
          });
        }
      }, 1000);

      return () => {
        clearInterval(updateInterval);
        cleanupMonitor();
      };
    } catch (error) {
      console.error("Error initializing monitor:", error);
    }
  }, [noActivityThreshold]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>User Activity Monitor</h1>

          <div className={styles.cardGrid}>
            {/* Threshold input card */}
            <div className={`${styles.infoCard} ${styles.thresholdCard}`}>
              <h2 className={styles.cardTitle}>Inactivity Threshold</h2>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  value={noActivityThreshold}
                  onChange={(e) => setNoActivityThreshold(e.target.value)}
                  min="0"
                  className={styles.thresholdInput}
                />
                <span className={styles.inputUnit}>seconds</span>
              </div>
            </div>

            {/* Active time card */}
            <div className={`${styles.infoCard} ${styles.activeTimeCard}`}>
              <h2 className={styles.cardTitle}>Active Time</h2>
              <div className={styles.activeTime}>
                {monitorData.activeTime} S
              </div>
            </div>

            {/* Status card */}
            <div
              className={`${styles.infoCard} ${
                monitorData.isActive
                  ? styles.statusCardActive
                  : styles.statusCardInactive
              }`}
            >
              <h2 className={styles.cardTitle}>Current Status</h2>
              <div
                className={
                  monitorData.isActive
                    ? styles.statusActive
                    : styles.statusInactive
                }
              >
                {monitorData.isActive ? "Active" : "Inactive"}
              </div>
              {monitorData.pauseReason && (
                <div className={styles.pauseReason}>
                  Reason: {monitorData.pauseReason}
                </div>
              )}
            </div>

            {/* Details card */}
            <div className={`${styles.infoCard} ${styles.detailsCard}`}>
              <h2 className={styles.cardTitle}>Details</h2>
              <pre className={styles.preBlock}>
                {JSON.stringify(monitorData.userInfo || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitor;
