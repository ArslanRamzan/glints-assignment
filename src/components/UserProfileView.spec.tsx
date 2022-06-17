import { Divider, Empty } from "antd";
import { shallow } from "enzyme";
import fetch from 'jest-fetch-mock';
import UserProfileView from "../components/UserProfileView";
import { fetchDataFromAPI, patchDataOnServer } from "../helper";

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

describe("<UserProfile />", ()=> {

    it('should populate profilelist on component load', () => {
        const wrapper = shallow(
            <UserProfileView />
        );
        const profileList = [{
            "_id": "62a83d978c6fcae2f519067d",
            "name": "Mousse",
            "age": 44,
            "profile_image": "https://glints-assets.s3.us-west-2.amazonaws.com/dummy.jpg",
            "experiences": [
                {
                    "job_title": "Engineer",
                    "job_description": "Managing mobile web",
                    "company": "Aplhasquad",
                    "company_logo": "https://glints-assets.s3.us-west-2.amazonaws.com/dummy.jpg",
                    "start_date": 1651795200,
                    "end_date": 1652745600
                }
            ],
            "__v": 0,
            "id": 1112,
        }] 
        fetch.mockResponseOnce(JSON.stringify(profileList));
        const onResponse = jest.fn();
        const onError = jest.fn();
        return fetchDataFromAPI('https://nodejs-mongo-api-app.herokuapp.com/api/getAll')
            .then(onResponse)
            .catch(onError)
            .finally(() => {
              expect(onResponse).toHaveBeenCalled();
              expect(onError).not.toHaveBeenCalled();
            
              expect(onResponse.mock.calls[0][0][0]).toEqual(profileList[0]);
        });
    });

    it('should sync profilelist', () => {
        const wrapper = shallow(
            <UserProfileView />
        );
        const profile : any= {
            "_id": "62a83d978c6fcae2f519067d",
            "name": "Mousse",
            "age": 44,
            "profile_image": "https://glints-assets.s3.us-west-2.amazonaws.com/dummy.jpg",
            "experiences": [
                {
                    "job_title": "Engineer",
                    "job_description": "Managing mobile web",
                    "company": "Aplhasquad",
                    "company_logo": "https://glints-assets.s3.us-west-2.amazonaws.com/dummy.jpg",
                    "start_date": 1651795200,
                    "end_date": 1652745600
                }
            ],
            "__v": 0,
            "id": 1112,
        }
        fetch.mockResponseOnce(JSON.stringify(profile));
        const onResponse = jest.fn();
        const onError = jest.fn();
        return patchDataOnServer(`https://nodejs-mongo-api-app.herokuapp.com/api/update/${profile._id}`, profile)
            .then(onResponse)
            .catch(onError)
            .finally(() => {
              expect(onResponse).toHaveBeenCalled();
              expect(onError).not.toHaveBeenCalled();
            
              expect(onResponse.mock.calls[0][0]["data"]).toEqual(profile);
        });
    });
})
