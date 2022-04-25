import React, { useCallback } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { IoMdSync } from "react-icons/io";
import { useDeviceDetection } from "hooks";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useSynchronizeMutation, useGetPlatformsQuery } from "services";
import {
  authSelector,
  syncSelector,
  updateSync,
  syncTutorialSelector,
  updateSyncTutorial,
} from "features";
import {
  Alert,
  QRCode,
  Button,
  useTitle,
  InlineLoader,
  PageAnimationWrapper,
} from "components";
import SyncTutorial from "./tutorials/SyncTutorial";

const Sync = () => {
  const { t } = useTranslation();
  useTitle(t("sync.page-title"));
  const isMobile = useDeviceDetection();
  const auth = useSelector(authSelector);
  const syncState = useSelector(syncSelector);
  const tutorial = useSelector(syncTutorialSelector);
  const dispatch = useDispatch();
  const [synchronize, { isLoading: fetchingURL }] = useSynchronizeMutation();
  const { data: platforms = {} } = useGetPlatformsQuery(auth);
  const { savedPlatforms = [] } = platforms;
  const { status, qrLink } = syncState;
  const hasSavedPlatforms = savedPlatforms.length ? true : false;

  function startTutorial() {
    dispatch(
      updateSyncTutorial({
        enabled: true,
      })
    );
  }

  const handleSync = useCallback(async () => {
    dispatch(
      updateSync({
        status: "loading",
      })
    );
    try {
      const response = await synchronize(auth);
      //using redux matcher to update state on matchFulfilled here
      if (!response.error) {
        const { syncURL } = response.data;
        const ws = new WebSocket(syncURL);
        ws.onopen = () => {
          toast.success(t("sync.alerts.sync-started"));
          dispatch(
            updateSync({
              status: "connected",
            })
          );
        };
        // listen to data sent from the websocket server
        ws.onmessage = (evt) => {
          if (evt.data === "200- ack") {
            toast.success(t("sync.alerts.sync-complete"));
            dispatch(
              updateSync({
                status: "complete",
              })
            );
          } else if (evt.data === "201- pause") {
            toast.success(t("sync.alerts.sync-scanned"));
            dispatch(
              updateSync({
                status: "scanned",
              })
            );
          } else {
            dispatch(
              updateSync({
                qrLink: evt.data,
              })
            );
          }
        };

        ws.onclose = () => {
          toast.success(t("sync.alerts.sync-closed"));
          dispatch(
            updateSync({
              status: "disconnected",
            })
          );
        };

        ws.onerror = (err) => {
          toast.error(t("sync.alerts.sync-error"));
          dispatch(
            updateSync({
              status: "disconnected",
            })
          );
        };
      } else {
        toast.error(t("error-messages.general-error-message"));
        dispatch(
          updateSync({
            status: "disconnected",
          })
        );
      }
    } catch (error) {
      toast.error(t("error-messages.general-error-message"));
    }
  }, [auth, synchronize, t, dispatch]);

  // Only allow sync if at least 1 platform is saved
  if (!hasSavedPlatforms) {
    return (
      <PageAnimationWrapper>
        <div className="grid max-w-screen-md min-h-screen grid-cols-2 px-6 py-20 mx-auto prose md:px-8">
          <div className="text-center col-span-full">
            <h1 className="inline-flex items-center mb-0 text-4xl font-bold">
              <IoMdSync size={48} className="mr-2" />
              <span>{t("sync.heading")}</span>
            </h1>

            <div className="max-w-screen-sm mx-auto my-4">
              <Alert
                kind="primary"
                message={t("sync.alerts.no-platforms")}
                hideCloseButton
              />
            </div>
            <div className="my-8">
              <span>{t("sync.section-1.details")} &nbsp;</span>
              <details>
                <summary className="text-blue-800">
                  {t("sync.section-1.summary.caption")}
                </summary>
                {t("sync.section-1.summary.details")}
              </details>
            </div>

            <Link
              to="/dashboard/wallet"
              className="inline-flex items-center justify-center px-6 py-2 text-white no-underline bg-blue-800 rounded-lg outline-none focus:outline-none hover:bg-blue-900"
            >
              {t("sync.section-1.cta-button-text")}
            </Link>
          </div>
        </div>
      </PageAnimationWrapper>
    );
  }

  return (
    <PageAnimationWrapper>
      <div className="grid max-w-screen-xl min-h-screen grid-cols-2 px-6 mx-auto my-10 prose md:px-8">
        <div className="col-span-full lg:col-span-1">
          <h1 className="inline-flex items-center mb-0 text-xl font-bold md:text-3xl">
            <IoMdSync size={42} className="mr-2" />
            <span>{t("sync.heading")}</span>
          </h1>

          <div className="tutorial-instructions">
            <p>{t("sync.section-2.paragraph-1")}</p>
            <p>{t("sync.section-2.paragraph-2")}</p>
            <p>{t("sync.section-2.paragraph-3")}</p>
            <ol>
              <li>{t("sync.section-2.sync-steps.1")}</li>
              <li>{t("sync.section-2.sync-steps.2")}</li>
              <li>{t("sync.section-2.sync-steps.3")}</li>
            </ol>
          </div>

          {!tutorial.showQR && (
            <div className="flex flex-col items-center px-6 my-8 space-y-4 lg:hidden">
              <Button
                className="w-full mobile-sync-button"
                onClick={() => handleSync()}
              >
                <IoMdSync size={22} />
                <span className="ml-1">{t("labels.sync")}</span>
              </Button>
              <Button
                outline
                className="w-full mobile-tutorial-button"
                onClick={() => startTutorial()}
              >
                {t("labels.tutorial")}
              </Button>
            </div>
          )}
        </div>

        <div className="col-span-full lg:col-span-1">
          {tutorial.showQR && (
            <QRCode
              value="tutorial"
              size={300}
              className="block p-2 mx-auto border rounded-lg shadow tutorial-qr"
            />
          )}

          {status === "connected" && (
            <QRCode
              value={qrLink}
              size={300}
              className="block p-2 mx-auto border rounded-lg shadow"
            />
          )}

          {status === "disconnected" && !tutorial.showQR && !isMobile && (
            <div className="mx-auto border border-gray-300  w-[300px] h-[300px] rounded-lg shadow-md flex flex-col align-center justify-center px-16 space-y-4">
              <Button
                className="mt-4 desktop-sync-button"
                onClick={() => handleSync()}
              >
                <IoMdSync size={22} />
                <span className="ml-1">{t("labels.sync")}</span>
              </Button>
              <Button
                outline
                className="desktop-tutorial-button"
                onClick={() => startTutorial()}
              >
                {t("labels.tutorial")}
              </Button>
            </div>
          )}
          {(status === "loading" || status === "scanned" || fetchingURL) && (
            <InlineLoader />
          )}

          <div className="mx-auto text-center">
            <p className="font-bold text-md">
              <span>{t("sync.section-2.status.heading")} : </span> &nbsp;
              <span className="font-normal">
                {t(`sync.section-2.status.${status}`)}
              </span>
            </p>
          </div>
        </div>
      </div>
      <SyncTutorial />
    </PageAnimationWrapper>
  );
};
export default Sync;
