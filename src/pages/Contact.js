import React from "react";
import { FiMail, FiGlobe, FiMessageSquare } from "react-icons/fi";
import { PageAnimationWrapper } from "components";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  return (
    <PageAnimationWrapper>
      <div className="min-h-screen">
        <div className="max-w-full px-8 pt-20 pb-24 mx-auto prose prose-invert md:px-16 bg-gradient-to-br from-blue-800 to-blue-400 ">
          <h1 className="md:text-5xl">{t("contact.heading")}</h1>
          <p className="my-0">{t("contact.details")}</p>
        </div>

        <div className="max-w-screen-xl p-6 -mt-16 prose bg-white md:mx-12 rounded-3xl md:p-12">
          <div className="flex items-center">
            <div className="mr-2 text-blue-800 lg:mr-4">
              <FiMail className="w-7 h-7 lg:w-10 lg:h-10" />
            </div>
            <div className="">
              <p className="my-0">{t("contact.email")}</p>
              <h4 className="my-0">
                <a href="mailto:developers@smswithoutborders.com">
                  developers@smswithoutborders.com
                </a>
              </h4>
            </div>
          </div>
          <div className="flex items-center my-8">
            <div className="mr-2 text-blue-800 lg:mr-4">
              <FiMessageSquare className="w-7 h-7 lg:w-10 lg:h-10" />
            </div>
            <div className="">
              <p className="my-0">IRC</p>
              <h4 className="my-0">freenode/#afkanerd</h4>
            </div>
          </div>
          <div className="flex items-center my-8">
            <div className="mr-2 text-blue-800 lg:mr-4">
              <FiGlobe className="w-7 h-7 lg:w-10 lg:h-10" />
            </div>
            <div className="">
              <p className="my-0">{t("contact.website")}</p>
              <h4 className="my-0">
                <a
                  href="https://smswithoutborders.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://smswithoutborders.com
                </a>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </PageAnimationWrapper>
  );
};

export default Contact;
