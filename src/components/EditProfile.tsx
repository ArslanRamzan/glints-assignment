import { Button, DatePicker, Divider, Empty, Form, Input, message, Spin } from "antd";
import axios from "axios";
import moment from "moment";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { IProfileList } from "../@types/ProfileList";

const EditProfile: React.FC = (props) => {
    const [userProfileData, setUserProfileData] = useState<IProfileList>();
    const [loadingProfileList, setLoadingProfileList] = useState<boolean>(false);
    const [errorLoadingProfileList, setErrorLoadingProfileList] = useState<boolean>(false);
    let history = useHistory<{ userProfile: IProfileList }>();
    const profileData = history.location.state?.userProfile
    let params = useParams<{id : string}>();
    const [form] = Form.useForm();
    const [experienceIDs, setExperienceIDs] = useState<Array<string>>([]);
    const [profilePhoto, setProfilePhoto] = useState('');
    useEffect(()=>{
        setUserProfileData(profileData)
        if(!(profileData && Object.keys(profileData).length > 0)){
            fetchUserData();
            form.setFieldsValue({
                name: userProfileData?.name,
                age: userProfileData?.age,
                profile_image: userProfileData?.profile_image,
                experience: userProfileData?.experiences
          });
        }
    },[])
    const fetchUserData = () => {
        setLoadingProfileList(true);
        fetch(`https://nodejs-mongo-api-app.herokuapp.com/api/getOne/${params.id}`)
        .then((response) => response.json())
        .then((response) => {
            onSuccess(response)
        })
        .catch(() => {
            onFailure();
        });
    };
    const onSuccess = (profile: IProfileList) => {
        setLoadingProfileList(false);
        setErrorLoadingProfileList(false);
        setUserProfileData(profile);
    }
    const onFailure = () => {
        setLoadingProfileList(false);
        setErrorLoadingProfileList(true);
    }
      
    const renderNoDataView = (description: string) => {
      return <Empty description={description}/>;
    }

    const isNetworkConnected = () => {
        return window.navigator.onLine;
    }

    const onFormSubmit = useCallback((values: FormData): void => {
        let formValues : any = values;
        let experiencesData = [];
        for (const key in formValues) {
            if(key.includes('experience')){
                experiencesData.push(formValues[key]);
            }
        }
        var updatedExperienceWithDates = experiencesData.map(experience=> {
            let expDates = experience.experience_dates;
            const startDate = expDates[0].format().split('T')[0];
            const endDate = expDates[1].format().split('T')[0];
            return {
                job_title : experience.job_title,
                job_description : experience.job_description,
                company : experience.company,
                company_logo : experience.company_logo,
                start_date : convertDateToTimeStamp(startDate),
                end_date : convertDateToTimeStamp(endDate)
            }
        })
        var updatedExperienceWithDatesAndCompanyLogo = experiencesData.map((experience, index)=> {
            let expDates = experience.experience_dates;
            const startDate = expDates[0].format().split('T')[0];
            const endDate = expDates[1].format().split('T')[0];

            const indexWiseCompanyLogo = experienceIDs.findIndex(element => {
                if (element.includes(`experience-${index + 1}`)) {
                  return true;
                }
                return false;
            });
            let company_logo = experienceIDs[indexWiseCompanyLogo]
            
            return {
                job_title : experience.job_title,
                job_description : experience.job_description,
                company : experience.company,
                company_logo : company_logo ? company_logo .split('~')[1]: experience.company_logo,
                start_date : convertDateToTimeStamp(startDate),
                end_date : convertDateToTimeStamp(endDate)
            }
        })

        let userId : any = profileData?._id || userProfileData?._id
        if(isNetworkConnected()){
            let postObjectForOnlineRequests : any = {
                name: formValues.name,
                age: parseInt(formValues.age),
                profile_image: localStorage.getItem('PROFILE_PHOTO') ? localStorage.getItem('PROFILE_PHOTO') : formValues.profile_image,
                experiences: updatedExperienceWithDatesAndCompanyLogo,
                _id: userId
            }
            sendUpdateApiCall(userId, postObjectForOnlineRequests);
        }else{
            let postObjectForOfflineRequests : any = {
                name: formValues.name,
                age: parseInt(formValues.age),
                profile_image: formValues.profile_image,
                experiences: updatedExperienceWithDates,
                _id: userId
            }
            updateFormDataLocally(postObjectForOfflineRequests)
        }
    },[])

    const sendUpdateApiCall = async (userId : string, postObject : IProfileList) => {
        try{
            const response = await axios.patch(`https://nodejs-mongo-api-app.herokuapp.com/api/update/${userId}`, postObject);
            if(response){
                localStorage.removeItem('PROFILE_PHOTO')
            }
            message.success('Your profile is being updated')
            history.goBack();
        }catch(e){

        }
    }

    const updateFormDataLocally = (postObject : IProfileList) => {
        let localStorageObject : any = localStorage.getItem('PROFILE_DATA');
        const listData = JSON.parse(localStorageObject)
        let updatedFormData = listData.map((profile : IProfileList)=>{
            if(profile._id === params.id){
                profile = postObject;
            }
            return profile;
        })
        localStorage.removeItem('PROFILE_DATA')
        localStorage.setItem('PROFILE_DATA', JSON.stringify(updatedFormData))
        const locallyEditedProfilesObject : any = localStorage.getItem('OFFLINE_EDITED_PROFILES');
        if(locallyEditedProfilesObject){
            const locallyEditedProfiles = JSON.parse(locallyEditedProfilesObject)
            locallyEditedProfiles.push(postObject)
            localStorage.setItem('OFFLINE_EDITED_PROFILES', JSON.stringify(locallyEditedProfiles))
        }else{
            let profile = [];
            profile.push(postObject);
            localStorage.setItem('OFFLINE_EDITED_PROFILES', JSON.stringify(profile))
        }
        history.goBack();
    }

    const onSelectFile = (photoId : string) => async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event?.target?.files?.[0];
        const convertedFile = await convertToBase64(file as File);
        try{
            const s3URL = await axios.post(
                'https://nodejs-mongo-api-app.herokuapp.com/api/post-images',
                {
                    name: file?.name,
                    image: convertedFile,
                }
            );
            if(photoId.includes('exp')){
                let expIds = experienceIDs;
                expIds.push(`${photoId}~${s3URL.data.link}`);
                setExperienceIDs(expIds)
            }else{
                setProfilePhoto(s3URL.data.link)
                localStorage.setItem('PROFILE_PHOTO', s3URL.data.link)
            }
        }catch (e) {
            message.error('picture not uploaded. please try again')
        }
    }
    const convertToBase64 = (file: File) => {
          return new Promise(resolve => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => {
                  resolve(reader.result);
              }
        })
    }

    const convertTimeStampToDate = (timeStamp: number) => {
        var date = moment.unix(timeStamp).format('DD MM YYYY').split(' ');
        var splittedDate = `${date[2]}-${date[1]}-${date[0]}`
        return moment(splittedDate.toString());
    }

    const convertDateToTimeStamp = (dateString: string) => {
        const date = new Date(dateString);
        const unixTimestamp = Math.floor(date.getTime() / 1000);
        return unixTimestamp;
    }

    const getEditForm = () => {
        return  <>
          <Divider orientation="left">Edit Profile</Divider>
        <Form onFinish={onFormSubmit} labelCol={{
          span: 3,
        }}
        wrapperCol={{
          span: 10,
        }}
  >
        <Form.Item initialValue={profileData?.name || userProfileData?.name} label="Name" name="name" rules={[
          {
            required: true,
            message: "Please enter username"
          },
        ]}>
          <Input name="name" />
        </Form.Item>
        <Form.Item initialValue={profileData?.age || userProfileData?.age} label="Age" name="age" rules={[
          {
            required: true,
            message: "Please enter user age"
          },
        ]}>
          <Input name="age" type={"number"} />
        </Form.Item>

        <Form.Item initialValue={profileData?.profile_image || userProfileData?.profile_image } name={"profile_image"} label="Profile Photo" rules={[
          {
            required: true,
            message: "Please choose a profile photo"
          },
        ]}>
            {(profileData?.profile_image || userProfileData?.profile_image) && <img style={{height: "35px", width:"35px", float:'left'}} src={profilePhoto ? profilePhoto : profileData?.profile_image || userProfileData?.profile_image}/>}
            <Input name="profile_image" type={"file"} accept="image/*" style={{float: 'left', width: '95%'}} onChange={onSelectFile(`profile_image`)} />
        </Form.Item>
        
        <Divider orientation="left">Work Experiences</Divider>
        {(profileData?.experiences || userProfileData?.experiences) && (profileData.experiences || userProfileData?.experiences).map((experience, index)=>{
            return <div style={{marginBottom: '50px'}}>
                <Form.Item initialValue={experience.job_title} name={[`experience-${index+1}`, "job_title"]} label="Job Title" rules={[
                  {
                    required: true,
                    message: "Please enter job title"
                  },
                ]}>
                  <Input name="job_title" />
                </Form.Item>

                <Form.Item initialValue={experience.job_description} name={[`experience-${index+1}`, "job_description"]} label="Job Description" rules={[
                  {
                    required: true,
                    message: "Please enter job description"
                  },
                ]}>
                  <Input name="job_description" />
                </Form.Item>

                <Form.Item initialValue={experience.company} name={[`experience-${index+1}`, "company"]} label="Company" rules={[
                  {
                    required: true,
                    message: "Please enter company name"
                  },
                ]}>
                  <Input name="company" />
                </Form.Item>

                <Form.Item initialValue={experience.company_logo } name={[`experience-${index+1}`, "company_logo"]} label="Company Logo" rules={[
                  {
                    required: true,
                    message: "Please choose a company logo"
                  },
                ]}>
                    {experience.company_logo && <img style={{height: "35px", width:"35px", float:'left'}} src={experience.company_logo}/>}
                    <Input name="company_logo" type={"file"} accept="image/*" style={{float: 'left', width: '95%'}} onChange={onSelectFile(`experience-${index+1}`)} />
                </Form.Item>

                <Form.Item initialValue={[convertTimeStampToDate(experience.start_date), convertTimeStampToDate(experience.end_date)]} name={[`experience-${index+1}`, "experience_dates"]} label="Tenure" rules={[
                  {
                    required: true,
                    message: "Please choose a valid date"
                  },
                ]}>
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
            </div>
        })}   
        <Form.Item>
          <Button htmlType="submit" style={{marginLeft: '917px'}}>Submit</Button>
        </Form.Item>
      </Form>
      </>
    }

    return (
        <div className="">
            {loadingProfileList && <Spin></Spin>}
            {!loadingProfileList && getEditForm()}
            {errorLoadingProfileList && renderNoDataView("Error fetching data. Check your internet connection")}
        </div>
    );
};

export default EditProfile;
