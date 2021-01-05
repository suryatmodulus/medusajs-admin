import React, { useState, useEffect } from "react"
import { Text, Flex, Box } from "rebass"
import { useForm, useFieldArray } from "react-hook-form"

import Modal from "../../../components/modal"
import Input from "../../../components/input"
import CurrencyInput from "../../../components/currency-input"
import Button from "../../../components/button"
import Select from "../../../components/select"
import Spinner from "../../../components/spinner"

import useMedusa from "../../../hooks/use-medusa"
import Medusa from "../../../services/api"

const NewShipping = ({
  isReturn,
  fulfillmentOptions,
  region,
  onCreated,
  onSubmit,
  onDelete,
  onClick,
}) => {
  const { control, register, handleSubmit } = useForm()
  const { store, isLoading } = useMedusa("store")
  const { shipping_profiles, isLoading: isProfilesLoading } = useMedusa(
    "shippingProfiles"
  )

  const handleSave = data => {
    const fOptions = fulfillmentOptions.map(provider => {
      const filtered = provider.options.filter(
        o => !!o.is_return === !!isReturn
      )

      return {
        ...provider,
        options: filtered,
      }
    })

    const [providerIndex, optionIndex] = data.fulfillment_option.split(".")
    const { provider_id, options } = fOptions[providerIndex]

    let reqs = []
    if (data.requirements) {
      reqs = Object.entries(data.requirements).reduce((acc, [key, value]) => {
        if (parseInt(value) && parseInt(value) > 0) {
          acc.push({ type: key, value })
          return acc
        } else {
          return acc
        }
      }, [])
    }

    const payload = {
      name: data.name,
      data: options[optionIndex],
      region_id: region._id,
      profile_id: data.profile_id,
      requirements: reqs,
      price: {
        type: "flat_rate",
        amount: data.price.amount,
      },
      is_return: isReturn,
      provider_id,
    }

    Medusa.shippingOptions.create(payload).then(() => {
      if (onCreated) {
        onCreated()
      }
      onClick()
    })
  }

  const options = fulfillmentOptions.reduce((acc, provider, p) => {
    const filtered = provider.options.filter(o => !!o.is_return === !!isReturn)

    return acc.concat(
      filtered.map((option, o) => ({
        label: `${option.id} via ${provider.provider_id}`,
        value: `${p}.${o}`,
      }))
    )
  }, [])

  const profileOptions = isProfilesLoading
    ? []
    : shipping_profiles.map(p => ({
        label: p.name,
        value: p._id,
      }))

  return (
    <Modal onClick={onClick}>
      <Modal.Body as="form" onSubmit={handleSubmit(handleSave)}>
        <Modal.Header>
          <Text>Add Shipping Option</Text>
        </Modal.Header>
        <Modal.Content flexDirection="column">
          <Box mb={4}>
            <Input
              mt={2}
              mb={3}
              label="Name"
              name="name"
              required={true}
              ref={register({ required: true })}
            />
          </Box>
          {!isReturn && (
            <Box mb={4}>
              <Text mb={3} fontSize={2}>
                Shipping Profile
              </Text>
              {isProfilesLoading ? (
                <Flex
                  fmlexDirection="column"
                  alignItems="center"
                  height="100vh"
                  mt="auto"
                >
                  <Box height="75px" width="75px" mt="50%">
                    <Spinner dark />
                  </Box>
                </Flex>
              ) : (
                <Select
                  required={true}
                  name="profile_id"
                  options={profileOptions}
                  ref={register({ required: true })}
                />
              )}
            </Box>
          )}
          <Box mb={4}>
            <Text mb={3} fontSize={2}>
              Fulfillment Method
            </Text>
            <Select
              required={true}
              name="fulfillment_option"
              options={options}
              ref={register({ required: true })}
            />
          </Box>
          <Box mb={4}>
            <Text mb={3} fontSize={2}>
              Price
            </Text>
            <CurrencyInput
              ref={register}
              name={"price.amount"}
              currency={region.currency_code}
            />
          </Box>
          {!isReturn && (
            <Flex mb={4} flexDirection="column">
              <Text fontSize={1} fontWeight={300} mb={1}>
                Requirements
              </Text>
              <Flex justifyContent="space-between" mt={2} width="100%">
                <CurrencyInput
                  inline
                  start={true}
                  width="100%"
                  fontSize="12px"
                  label="Min. subtotal"
                  name={`requirements.min_subtotal`}
                  currency={region.currency_code}
                  ref={register}
                />
              </Flex>
              <Flex justifyContent="space-between" mt={2} width="100%">
                <CurrencyInput
                  inline
                  width="100%"
                  start={true}
                  label="Max. subtotal"
                  fontSize="12px"
                  name={`requirements.max_subtotal`}
                  currency={region.currency_code}
                  ref={register}
                />
              </Flex>
            </Flex>
          )}
        </Modal.Content>
        <Modal.Footer justifyContent="flex-end">
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default NewShipping